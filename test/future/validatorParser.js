module.exports = function register(
  id,
  name = { $type: String, $size: 100 },
  age = { $type: Number, $gt: 12, $lte: 100 },
  image = { $type: Buffer, $size: 1000 * 1000 },
  account = { $in: ["user", "writer", "provider"] },
  about = { $charset: "utf8", $size: 300 },
  password = { $encode: "bcript" },
  info,
  address,
  isMale = true,
  location = "hanoi"
  /* this is comment */
  // TODO : more
  // TODO : genarate function to validate input in fontware core plugin
) {
  /* logic a *{asd} part */

  return {
    $type: "text/plain",
    /* this is $comment 2 */
    $encode: "PPMC"
    // TODO : genarate function to optimize perfomance
  };
}
