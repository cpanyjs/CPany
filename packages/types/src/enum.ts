export enum Verdict {
  OK = 'OK',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
  COMPILATION_ERROR = 'COMPILATION_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  WRONG_ANSWER = 'WRONG_ANSWER',
  PRESENTATION_ERROR = 'PRESENTATION_ERROR',
  TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  IDLENESS_LIMIT_EXCEEDED = 'IDLENESS_LIMIT_EXCEEDED',
  SECURITY_VIOLATED = 'SECURITY_VIOLATED',
  CRASHED = 'CRASHED',
  INPUT_PREPARATION_CRASHED = 'INPUT_PREPARATION_CRASHED',
  CHALLENGED = 'CHALLENGED',
  SKIPPED = 'SKIPPED',
  TESTING = 'TESTING',
  REJECTED = 'REJECTED'
}

export enum ParticipantType {
  CONTESTANT = 'CONTESTANT',
  PRACTICE = 'PRACTICE',
  VIRTUAL = 'VIRTUAL',
  MANAGER = 'MANAGER',
  OUT_OF_COMPETITION = 'OUT_OF_COMPETITION'
}