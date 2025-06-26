import mongoose from "mongoose";

// Define the schema for the Country model
const countrySchema = new mongoose.Schema({
  CountryID: {
    type: Number,
    required: true,
  },
  Title: {
    type: String,
    required: true,
  },
  CountryCode: {
    type: String,
    required: true,
  },
});

// Create the Country model
const Country =
  mongoose.models.Country || mongoose.model("Country", countrySchema);

// Define the TypeScript interface for Country
export interface ICountry {
  CountryID: number;
  Title: string;
  CountryCode: string;
}

// Export the model and the interface
export default Country;
