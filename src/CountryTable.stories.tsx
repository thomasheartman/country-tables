import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import CountryTableWithData from "./CountryTable";

export default {
  title: "Primary table",
  component: CountryTableWithData,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof CountryTableWithData>;

const Template: ComponentStory<typeof CountryTableWithData> = () => (
  <CountryTableWithData />
);

export const Primary = Template.bind({});
Primary.args = {};
