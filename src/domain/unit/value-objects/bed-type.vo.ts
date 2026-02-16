export enum BedTypeEnum {
  KING = 'KING',
  QUEEN = 'QUEEN',
  DOUBLE = 'DOUBLE',
  SINGLE = 'SINGLE',
  SOFA_BED = 'SOFA_BED',
}

export interface Bed {
  type: BedTypeEnum;
  count: number;
}

export interface Bedroom {
  roomName: string;
  beds: Bed[];
}
