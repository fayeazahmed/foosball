// Credit - https://joshbradley.me/object-collisions-with-canvas/

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returning a new Vector creates immutability
   * and allows chaining. These properties are
   * extremely useful with the complex formulas
   * we'll be using.
   **/
  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  dotProduct(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  get direction() {
    return Math.atan2(this.x, this.y);
  }
}

const collisionVector = (b1, b2) => {
  return b1.velocity

    // Take away from the starting velocity
    .subtract(

      // Subtract the positions
      b1.position
        .subtract(b2.position)

        /**
         * Multiply by the dot product of
         * the difference between the velocity
         * and position of both vectors
         **/
        .multiply(
          b1.velocity
            .subtract(b2.velocity)
            .dotProduct(
              b1.position
                .subtract(b2.position)
            )
          / b1.position
            .subtract(b2.position)
            .magnitude ** 2
        )

      /**
       * Multiply by the amount of mass the
       * object represents in the collision.
       **/
      // .multiply(
      //  (2 * b2.sphereArea)
      //  / (b1.sphereArea + b2.sphereArea)
      // )
    );
}