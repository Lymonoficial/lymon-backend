export interface GuestNoteDto {
  id: string;
  guestId: string;
  note: string;
  type: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetGuestNotesByGuestIdResult {
  items: GuestNoteDto[];
}
