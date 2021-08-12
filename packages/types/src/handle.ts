import type { ParticipantType } from './enum';
import type { ISubmission } from './submission';

export interface IHandle {
  type: string;
  handle: string;
  submissions: ISubmission[];
  avatar?: string;
  handleUrl?: string;
}

export interface IAuthor {
  members: string[];
  participantType: ParticipantType;
  teamName?: string;
}
