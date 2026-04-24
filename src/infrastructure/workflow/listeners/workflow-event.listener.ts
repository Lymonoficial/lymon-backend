import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';
import { WorkflowExecution } from '@/domain/workflow/entities/workflow-execution.entity';
import { WorkflowExecutionId } from '@/domain/workflow/value-objects/workflow-execution-id.vo';
import {
  WORKFLOW_CONFIG_REPOSITORY,
  type WorkflowConfigRepository,
} from '@/domain/workflow/repositories/workflow-config.repository';
import {
  WORKFLOW_EXECUTION_REPOSITORY,
  type WorkflowExecutionRepository,
} from '@/domain/workflow/repositories/workflow-execution.repository';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { WorkflowExecutorService } from '@/application/workflow/services/workflow-executor.service';
import {
  RESERVATION_CHECKED_IN_EVENT,
  ReservationCheckedInEvent,
} from '@/domain/reservation/events/reservation-checked-in.event';
import {
  RESERVATION_CHECKED_OUT_EVENT,
  ReservationCheckedOutEvent,
} from '@/domain/reservation/events/reservation-checked-out.event';
import {
  RESERVATION_CONFIRMED_EVENT,
  ReservationConfirmedEvent,
} from '@/domain/reservation/events/reservation-confirmed.event';
import {
  RESERVATION_CANCELLED_EVENT,
  ReservationCancelledEvent,
} from '@/domain/reservation/events/reservation-cancelled.event';

@Injectable()
export class WorkflowEventListener {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(
    @Inject(WORKFLOW_CONFIG_REPOSITORY)
    private readonly workflowConfigRepository: WorkflowConfigRepository,
    @Inject(WORKFLOW_EXECUTION_REPOSITORY)
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    private readonly executorService: WorkflowExecutorService,
  ) {}

  @OnEvent(RESERVATION_CHECKED_IN_EVENT)
  async handleCheckedIn(event: ReservationCheckedInEvent): Promise<void> {
    try {
      await this.runImmediate(
        WorkflowType.CHECK_IN_NOTIFICATION,
        event.tenantId,
        {
          reservationId: event.reservationId,
          guestId: event.guestId,
          unitId: event.unitId,
          propertyId: event.propertyId,
          checkInActualAt: event.checkInActualAt,
        },
      );
    } catch (error) {
      this.logger.error('WorkflowEventListener.handleCheckedIn failed', error);
    }
  }

  @OnEvent(RESERVATION_CHECKED_OUT_EVENT)
  async handleCheckedOut(event: ReservationCheckedOutEvent): Promise<void> {
    try {
      await this.runImmediate(
        WorkflowType.HOUSEKEEPING_TASK_ON_CHECKOUT,
        event.tenantId,
        {
          reservationId: event.reservationId,
          guestId: event.guestId,
          unitId: event.unitId,
          propertyId: event.propertyId,
          checkOutActualAt: event.checkOutActualAt,
        },
      );
    } catch (error) {
      this.logger.error('WorkflowEventListener.handleCheckedOut failed', error);
    }
  }

  @OnEvent(RESERVATION_CONFIRMED_EVENT)
  async handleConfirmed(event: ReservationConfirmedEvent): Promise<void> {
    await this.handleReturningGuestFlag(event);
    await this.handleVipAlert(event);
  }

  @OnEvent(RESERVATION_CANCELLED_EVENT)
  async handleCancelled(event: ReservationCancelledEvent): Promise<void> {
    try {
      const config = await this.workflowConfigRepository.findByTenantAndType(
        event.tenantId,
        WorkflowType.CANCELLATION_FOLLOWUP,
      );
      if (!config || !config.isEnabled()) return;

      const delayHours = (config.getParams().delayHours as number) ?? 1;
      const scheduledAt = new Date(
        Date.now() + delayHours * 60 * 60 * 1000,
      );

      const execution = WorkflowExecution.createDelayed(
        TenantId.createFromString(event.tenantId),
        WorkflowType.CANCELLATION_FOLLOWUP,
        config.getId()!,
        {
          reservationId: event.reservationId,
          guestId: event.guestId,
          cancelledAt: event.cancelledAt,
          reason: event.reason,
        },
        scheduledAt,
      );

      await this.workflowExecutionRepository.save(execution);

      this.logger.log(
        `CANCELLATION_FOLLOWUP scheduled for tenant ${event.tenantId} at ${scheduledAt.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('WorkflowEventListener.handleCancelled failed', error);
    }
  }

  private async handleReturningGuestFlag(
    event: ReservationConfirmedEvent,
  ): Promise<void> {
    try {
      const config = await this.workflowConfigRepository.findByTenantAndType(
        event.tenantId,
        WorkflowType.RETURNING_GUEST_FLAG,
      );
      if (!config || !config.isEnabled()) return;

      const minBookings = (config.getParams().minBookings as number) ?? 2;
      const bookingCount = await this.reservationRepository.countByGuestId(
        event.tenantId,
        event.guestId,
      );

      if (bookingCount < minBookings) return;

      await this.runImmediate(
        WorkflowType.RETURNING_GUEST_FLAG,
        event.tenantId,
        {
          reservationId: event.reservationId,
          guestId: event.guestId,
          bookingCount,
          checkIn: event.checkIn,
          checkOut: event.checkOut,
        },
      );
    } catch (error) {
      this.logger.error(
        'WorkflowEventListener.handleReturningGuestFlag failed',
        error,
      );
    }
  }

  private async handleVipAlert(
    event: ReservationConfirmedEvent,
  ): Promise<void> {
    try {
      const config = await this.workflowConfigRepository.findByTenantAndType(
        event.tenantId,
        WorkflowType.VIP_ALERT,
      );
      if (!config || !config.isEnabled()) return;

      const guest = await this.guestRepository.findById(
        GuestId.createFromString(event.guestId),
      );
      if (!guest || !guest.getTags().includes('vip')) return;

      await this.runImmediate(WorkflowType.VIP_ALERT, event.tenantId, {
        reservationId: event.reservationId,
        guestId: event.guestId,
        checkIn: event.checkIn,
        checkOut: event.checkOut,
      });
    } catch (error) {
      this.logger.error(
        'WorkflowEventListener.handleVipAlert failed',
        error,
      );
    }
  }

  private async runImmediate(
    workflowType: WorkflowType,
    tenantId: string,
    contextSnapshot: Record<string, unknown>,
  ): Promise<void> {
    const config = await this.workflowConfigRepository.findByTenantAndType(
      tenantId,
      workflowType,
    );
    if (!config || !config.isEnabled()) return;

    const execution = WorkflowExecution.createImmediate(
      TenantId.createFromString(tenantId),
      workflowType,
      config.getId()!,
      contextSnapshot,
    );

    const executionId = await this.workflowExecutionRepository.save(execution);
    execution.setId(WorkflowExecutionId.create(executionId));

    await this.executorService.run(execution, config);
  }
}
