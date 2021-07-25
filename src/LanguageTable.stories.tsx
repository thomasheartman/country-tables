import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import LangTable from "./LanguageTable";

export default {
  title: "Language table",
  component: LangTable,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof LangTable>;

const Template: ComponentStory<typeof LangTable> = () => <LangTable />;

export const Primary = Template.bind({});
Primary.args = {};
