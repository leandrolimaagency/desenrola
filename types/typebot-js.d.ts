declare module "@typebot.io/js/web" {
  type TypebotEmbedOptions = {
    typebot: string;
    apiHost: string;
    prefilledVariables: Record<string, string>;
  };

  const Typebot: {
    initStandard(options: TypebotEmbedOptions): void;
  };

  export default Typebot;
}
