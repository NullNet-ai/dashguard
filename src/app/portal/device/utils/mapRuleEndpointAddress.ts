export type EndpointType = "address" | "network";

/**
 * Maps an internal address value to a human-readable format based on the endpoint type.
 *
 * @param {string} addrValue - The internal address value to be mapped.
 * @param {EndpointType} endpointType - The type of endpoint.
 * @returns {string} The mapped address value in a representable format.
 */
export const mapRuleEndpointAddress = (
  addrValue: string,
  endpointType: EndpointType,
) => {
  if (endpointType !== "network") {
    return addrValue;
  }

  switch (addrValue.toLowerCase()) {
    case "pptp":
      return "PPPT Clients";
    case "ppoe":
      return "PPoE Clients";
    case "l2tp":
      return "L2TP Clients";

    case "wan":
      return "WAN Subnets";
    case "wanip":
      return "WAN Address";

    case "lan":
      return "LAN Subnets";
    case "lanip":
      return "LAN Address";

    default:
      return addrValue;
  }
};
