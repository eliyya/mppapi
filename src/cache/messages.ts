import { Collection } from "@discordjs/collection";
import { randomUUID } from "node:crypto";

interface Message {
  id: string;
  content: string;
}

class Messages extends Collection<string, Message> {
  /**
   * Add a message to the cache
   * @param {string} content
   * @returns {this}
   */
  add(content: string): this {
    const message: Message = {
      id: randomUUID().split("-").at(-1) as string,
      content,
    };
    if (this.size > 200) this.delete(this.firstKey() as string);
    return this.set(message.id, message);
  }
}

export default new Messages();
