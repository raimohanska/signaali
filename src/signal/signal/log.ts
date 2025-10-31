import { ForEach } from "../interfaces/ForEach";

export function log(signal: ForEach<unknown>, message: string) {
  signal.forEach((value) => console.log(message, value));
}
