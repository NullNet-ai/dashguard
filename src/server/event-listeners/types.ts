export interface IEventAction {
  type: string;
  handler: (args: any) => Promise<any>;
}