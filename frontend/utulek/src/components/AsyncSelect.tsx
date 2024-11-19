import { uniqueId } from "lodash";
import React, { useEffect, useState } from "react";
import { Select, SelectProps } from "@material-tailwind/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AsyncSelect = React.forwardRef((props: SelectProps, ref: any) => {
  const [key, setKey] = useState("");

  useEffect(() => setKey(uniqueId()), [props]);

  return <Select key={key} ref={ref} {...props} />;
});

AsyncSelect.displayName = "AsyncSelect";

export default AsyncSelect;