// Dynamic weight allocation vectors based on request urgency
export const WEIGHT_MATRIX = {
  STANDARD: {
    dist: 0.2,
    rate: 0.25,
    price: 0.2,
    exp: 0.15,
    work: 0.1,
    resp: 0.1,
  },
  HIGH: {
    dist: 0.35,
    rate: 0.15,
    price: 0.05,
    exp: 0.15,
    work: 0.1,
    resp: 0.2,
  },
  EMERGENCY: {
    dist: 0.45,
    rate: 0.05,
    price: 0.0,
    exp: 0.2,
    work: 0.1,
    resp: 0.2,
  },
  FLEXIBLE: {
    dist: 0.1,
    rate: 0.3,
    price: 0.3,
    exp: 0.15,
    work: 0.1,
    resp: 0.05,
  },
};
