// this is a super basic placeholder element for when we don't have data, either
// because of an error or because it's still loading.
import React from "react";

// export for Storybook
export type fallbackReason =
  | { state: "loading" }
  | { state: "error"; msg?: string };

type BaseProps = {
  state: fallbackReason;
};

const Base = ({ state }: BaseProps) => {
  const createMessage = () => {
    switch (state.state) {
      case "loading":
        return "Getting data for you now 👷‍♀️";
      case "error":
        const additionalInfo = state.msg
          ? `This additional info may be of use to you: ${state.msg}`
          : "";
        return `Oh, no! An error occurred 😱 But don't worry, we'll try again shortly.\n\n${additionalInfo}`.trim();
    }
  };

  return (
    <div className="table-info-message">
      <p>{createMessage()}</p>
    </div>
  );
};

export default Base;
