(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  const character = document.createElement("img");
  character.className = "flyby-character";
  character.src = "assets/flyby-character.png";
  character.alt = "";
  character.setAttribute("aria-hidden", "true");
  character.draggable = false;
  document.body.appendChild(character);

  const randomBetween = (minimum, maximum) => (
    minimum + Math.random() * (maximum - minimum)
  );
  const spinAngles = [-540, -360, -270, -180, 180, 270, 360, 540];
  let previousRoute = -1;
  let intervalId = 0;
  let activeAnimation = null;

  function routeFor(index, width, height, padding) {
    const horizontalStart = randomBetween(height * .08, height * .92);
    const horizontalEnd = randomBetween(height * .08, height * .92);
    const verticalStart = randomBetween(width * .08, width * .92);
    const verticalEnd = randomBetween(width * .08, width * .92);
    const routes = [
      [{ x: -padding, y: horizontalStart }, { x: width + padding, y: horizontalEnd }],
      [{ x: width + padding, y: horizontalStart }, { x: -padding, y: horizontalEnd }],
      [{ x: verticalStart, y: -padding }, { x: verticalEnd, y: height + padding }],
      [{ x: verticalStart, y: height + padding }, { x: verticalEnd, y: -padding }],
      [{ x: -padding, y: -padding }, { x: width + padding, y: height + padding }],
      [{ x: width + padding, y: -padding }, { x: -padding, y: height + padding }],
      [{ x: -padding, y: height + padding }, { x: width + padding, y: -padding }],
      [{ x: width + padding, y: height + padding }, { x: -padding, y: -padding }]
    ];
    return routes[index];
  }

  function launchCharacter() {
    if (document.hidden) return;

    let routeIndex;
    do routeIndex = Math.floor(Math.random() * 8);
    while (routeIndex === previousRoute);
    previousRoute = routeIndex;

    const size = Math.round(randomBetween(86, 148));
    const padding = size * 1.5;
    const [start, end] = routeFor(routeIndex, window.innerWidth, window.innerHeight, padding);
    const travelAngle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
    const startRotation = travelAngle + randomBetween(-55, 55);
    const spin = spinAngles[Math.floor(Math.random() * spinAngles.length)];
    const endRotation = startRotation + spin;
    const scale = randomBetween(.82, 1.18);

    character.style.width = `${size}px`;
    character.style.height = `${size}px`;
    activeAnimation?.cancel();
    activeAnimation = character.animate([
      {
        opacity: 1,
        transform: `translate3d(${start.x}px,${start.y}px,0) rotate(${startRotation}deg) scale(${scale})`
      },
      {
        opacity: 1,
        transform: `translate3d(${end.x}px,${end.y}px,0) rotate(${endRotation}deg) scale(${scale})`
      }
    ], {
      duration: Math.round(randomBetween(2100, 2600)),
      easing: "cubic-bezier(.18,.72,.3,1)",
      fill: "none"
    });
    activeAnimation.finished.catch(() => {}).finally(() => {
      character.style.opacity = "0";
    });
  }

  function startInterval() {
    window.clearInterval(intervalId);
    intervalId = window.setInterval(launchCharacter, 3000);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      activeAnimation?.cancel();
      window.clearInterval(intervalId);
      character.style.opacity = "0";
    } else {
      startInterval();
    }
  });

  startInterval();
})();
