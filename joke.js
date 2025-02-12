import axios from "axios";

// Get a Random Joke
async function getJoke() {
  try {
    const response = await axios.get(
      "https://v2.jokeapi.dev/joke/Any?type=single"
    );
    return response.data.joke || "Couldn't find a joke.";
  } catch (error) {
    console.error("❌ Error fetching joke:", error.message);
    return "Error fetching a joke.";
  }
}

export default getJoke;
