const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  name: String,
  description: String,
  referralInfo: String,
  adhcEligible: Boolean,
  assessmentCriteria: String,
  targetGender: String,
  availability: String,
  billingMethod: String,
  cost: String,
  crisisKeywords: String,
  details: String,
  eligibilityInfo: String,
  ineligibilityInfo: String,
  fundingBody: String,
  healthcareCardHolders: Boolean,
  intakeInfo: String,
  intakePoint: String,
  isBulkBilling: Boolean,
  ndisApproved: Boolean,
  promotedService: Boolean,
  specialRequirements: String,
  language: String,
  ageGroupKeyword: String,
  ageGroupDescription: String,
  serviceTypes: String,
  indigenousClassification: String,
  capacityStatus: String,
  capacityStatusText: String,
  capacityFrequency: String,
  capacityLastNotification: String,
  capacityLastStatusUpdate: String,
  capacityExpireDate: String,
  accreditationName: String
});

const openingHoursSchema = new Schema({
  day: String,
  openTime: String,
  closeTime: String,
  openingHoursNote: String
});

const siteSchema = new Schema({
  name: String,
  accessibility: String,
  locationDetails: String,
  parkingInfo: String,
  publicTransportInfo: String,
  isMobile: Boolean,
  emailAddress: String,
  emailIsConfidential: Boolean,
  website: String,
  postalAddress: String,
  postalAddressState: String,
  postalAddressSuburb: String,
  postalAddressPostcode: String,
  postalAddressIsConfidential: Boolean,
  phoneNumber: String,
  phoneKind: String,
  phoneIsConfidential: Boolean,
  openingHours: [openingHoursSchema],
  addressBuilding: String,
  addressLevel: String,
  addressFlatUnit: String,
  addressStreetNumber: String,
  addressStreetName: String,
  addressStreetType: String,
  addressStreetSuffix: String,
  addressSuburb: String,
  addressState: String,
  addressPostcode: String,
  addressIsConfidential: Boolean,
  servicesInSite: [serviceSchema]
});

const organisationSchema = new Schema({
  name: String,
  description: String,
  createdAt: Date,
  lastUpdated: Date,
  website: String,
  abn: String,
  providerType: String,
  alsoKnownAs: String,
  emailAddress: String,
  emailIsConfidential: Boolean,
  postalAddress: String,
  postalAddressState: String,
  postalAddressSuburb: String,
  postalAddressPostcode: String,
  postalAddressIsConfidential: Boolean,
  phoneNumber: String,
  phoneKind: String,
  phoneIsConfidential: Boolean,
  ceo: String,
  sitesInOrganisation: [siteSchema]
});

module.exports = mongoose.model("Organisation", organisationSchema);