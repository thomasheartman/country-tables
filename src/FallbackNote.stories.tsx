import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import Note, { fallbackReason } from "./FallbackNote";

export default {
  title: "Table fallback elements",
  component: Note,
  argTypes: {
    type: { kind: "loading" },
  },
} as ComponentMeta<typeof Note>;

const Template: ComponentStory<typeof Note> = (args) => <Note {...args} />;

export const Loading = Template.bind({});
Loading.args = {
  state: { state: "loading" },
};

export const Error = Template.bind({});
Error.args = {
  state: { state: "error", msg: "Unmatched '}' on line 32." },
};
