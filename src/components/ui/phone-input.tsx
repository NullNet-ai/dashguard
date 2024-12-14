import React from "react";
import { PhoneInput as PrimitivePhoneInput,type PhoneInputProps } from "react-international-phone";
import "react-international-phone/style.css";

export default function PhoneInput({...props}: PhoneInputProps) {
  return (
    <PrimitivePhoneInput
      countrySelectorStyleProps={{
        buttonStyle: {
          padding: "1.2rem",
          paddingInline: "0.5rem",
          backgroundColor: "inherit",
          borderColor: "transparent",
          borderRightColor: "inherit",
          colorScheme: "normal",
        },
      }}
      defaultCountry="us"
      className=
        "mr-[1px] disabled:pointer-events-none disabled:border-transparent disabled:opacity-100 w-[90%] rounded-md !border-input bg-transparent text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed"
      
      inputStyle={{
        width: "100%",
        backgroundColor: "transparent",
        color: "inherit",
        borderColor: `transparent`,
        padding: "1.2rem",
        opacity: "inherit",
      }}
      inputClassName="ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent text-foreground disabled:opacity-100"
      {...props}
    />
  );
}
