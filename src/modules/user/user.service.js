import { User } from "../../DB/model/user.model.js";


export const profile = async (id) => {
  const user = await User.findById(id);
  return user;
};
