function enforceExhaustiveSwitch(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

export default enforceExhaustiveSwitch;
