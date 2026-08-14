import { useLayoutEffect, useState } from "react";

export default function useMeasure() {
  const [node, setNode] = useState(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, width];
}
