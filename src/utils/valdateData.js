const { z } = require("zod");

function validateData(req) {
  const { FirstName, LastName, email, password, age, photoUrl } = req.body;
  const requireBody = z.object({
    FirstName: z.string().min(2).max(30),
    LastName: z.string().min(2).max(30),
    email: z.string().email(),
    password: z.string().min(6),
    age: z.number().min(18),
    // photoUrl: z.string().url(),
  });

  const pasreBody = requireBody.safeParse(req.body);
  if (!pasreBody.success) {
    throw new Error(pasreBody.error.errors.map((err) => err.message).join(","));
  }
}

module.exports = {
  validateData,
};
