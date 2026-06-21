export default {
  name: "choose",
  aliases: ["pick", "select"],
  description: "Choose between multiple comma-separated options",
  usage: "choose <option1, option2, ...>",
  category: "fun",
  cooldown: 2,

  async execute(client, message, args) {
    const input = args.join(" ");

    if (!input) {
      return message.channel.send(
        "Please provide options separated by commas!"
      );
    }

    const options = input
      .split(",")
      .map((option) => option.trim())
      .filter((option) => option.length > 0);

    if (options.length < 2) {
      return message.channel.send(
        "Please provide at least 2 options separated by commas!"
      );
    }

    const choice = options[Math.floor(Math.random() * options.length)];
    await message.channel.send(`I choose: **${choice}**`);
  },
};
