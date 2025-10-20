const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`;

const index = async () => {
  try {
    const res = await fetch(BASE_URL, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    const data = await res.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};

export { index };
