export abstract class Account {
  readonly type: string;

  readonly username: string;

  constructor(type: string, username: string) {
    this.type = type;
    this.username = username;
  }
}
