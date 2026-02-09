import { Country, State, City } from "country-state-city";

export const countries = Country.getAllCountries();

export function getStates(countryCode: string) {
  return State.getStatesOfCountry(countryCode);
}

export function getCities(countryCode: string, stateCode: string) {
  return City.getCitiesOfState(countryCode, stateCode);
}

export const WORK_PREFERENCES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_site", label: "On-site" },
] as const;

export const WORK_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Internship" },
] as const;
