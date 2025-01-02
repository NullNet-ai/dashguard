import React, { useCallback } from "react";
import { Button } from "~/components/ui/button";

interface IFooterButtonProps {
  onClick: () => void;
  color: string;
  title: string;
}

const FooterButton: React.FC<IFooterButtonProps> = (props) => {
  const { onClick, color, title } = props;
  return (
    <Button autoFocus onClick={onClick} className="mr-2" color={color}>
      {title}
    </Button>
  );
};

export default FooterButton;
