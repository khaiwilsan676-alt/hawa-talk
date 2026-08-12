import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("6a78cfed00144ae90b36");

export const account = new Account(client);
export const databases = new Databases(client); // Just in case, though they didn't explicitly say DB yet
