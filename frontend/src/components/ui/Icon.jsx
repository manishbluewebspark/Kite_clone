import Body from "../../assets/car_details_icon/body.svg";
import Card from "../../assets/car_details_icon/card.svg";
import Check from "../../assets/car_details_icon/check.svg";
import Comfort from "../../assets/car_details_icon/comfort.svg";
import Document from "../../assets/car_details_icon/document.svg";
import EngineCapacity from "../../assets/car_details_icon/engine_capacity.svg";
import ExteriorInterior from "../../assets/car_details_icon/exterior_interior.svg";
import FuelType from "../../assets/car_details_icon/fuel_type.svg";
import GearBox from "../../assets/car_details_icon/gear_box.svg";
import InteriorFeatures from "../../assets/car_details_icon/interior_features.svg";
import Location from "../../assets/car_details_icon/location.svg";
import LuggageCapacity from "../../assets/car_details_icon/luggage_capacity.svg";
import Make from "../../assets/car_details_icon/make.svg";
import Model from "../../assets/car_details_icon/model.svg";
import NumberDoors from "../../assets/car_details_icon/number_doors.svg";
import Policy from "../../assets/car_details_icon/policy.svg";
import SafetyFeatures from "../../assets/car_details_icon/safety_features.svg";
import SeatingCapacity from "../../assets/car_details_icon/seating_capacity.svg";
import User from "../../assets/car_details_icon/user.svg";
import Plan from "../../assets/car_details_icon/plan.svg";
import ExteriorFeatures from "../../assets/car_details_icon/exterior_features.svg";
import InfotainmentFeatures from "../../assets/car_details_icon/infornment_features.svg";

const icons = {
  body: Body,
  card: Card,
  check: Check,
  comfort: Comfort,
  document: Document,
  engineCapacity: EngineCapacity,
  exteriorInterior: ExteriorInterior,
  fuelType: FuelType,
  gearBox: GearBox,
  interiorFeatures: InteriorFeatures,
  location: Location,
  luggageCapacity: LuggageCapacity,
  make: Make,
  model: Model,
  numberDoors: NumberDoors,
  policy: Policy,
  safetyFeatures: SafetyFeatures,
  seatingCapacity: SeatingCapacity,
  user: User,
  plan: Plan,
  exteriorFeatures: ExteriorFeatures,
  infotainmentFeatures: InfotainmentFeatures
};

export default function Icon({ name, size = 20, className = "" }) {
  const iconSrc = icons[name];

  if (!iconSrc) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <img
      src={iconSrc}
      width={size}
      height={size}
      className={className}
      alt={name}
    />
  );
}
