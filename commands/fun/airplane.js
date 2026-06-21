import { wait } from "../../utils/functions.js";

export default {
  name: "airplane",
  aliases: ["plane", "9eleven"],
  description: "watch a plane fly into a building",
  usage: "airplane",
  category: "fun",
  cooldown: 3,

  async execute(client, message, args) {
    const steps = 10;
    const frames = [];

    for (let i = 0; i < steps; i++) {
      const gap = " ".repeat(i * 2 + 1);
      const trailGap = " ".repeat((steps - i) * 2);
      frames.push(`👳‍♂️${gap}✈️${trailGap}🏢`);
    }
    frames.push(`👳‍♂️${" ".repeat(steps * 2 + 1)}🏢`);
    frames.push(`👳‍♂️${" ".repeat(steps * 2 - 1)}💥💥💥`);

    const msg = await message.channel.send(frames[0]);

    for (let i = 1; i < frames.length; i++) {
      await wait(200);
      await msg.edit(frames[i]).catch(() => {});
    }
  },
};
