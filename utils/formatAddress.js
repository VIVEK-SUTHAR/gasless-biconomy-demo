const ADDRESS_REGEX = /^(0x)?[\da-f]{40}$/i;
/**
 *
 * @param address Ethereum Address
 * @returns Shorted Address ex:0xa5...c50
 */

const formatAddress = (address) => {
  if (!address) {
    return "";
  }

  if (address.match(ADDRESS_REGEX)) {
    return `${address.slice(0, 4)}…${address.slice(
      address.length - 4,
      address.length
    )}`;
  }

  return address;
};

export default formatAddress;
