/**
 * Helper function - converts degrees to radians
 *
 * @param {number}  degrees
 *
 * @return {number}
 */
function deg2rad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Helper function - inverse of above
 * 
 * @param  {number} angle 
 * 
 * @return {number}
 */
function rad2deg(angle) {
  return angle * 57.29577951308232; // angle / Math.PI * 180
}

/**
 * Returns the distance in km on a sphere between fromLocation and toLocation
 * Expects Objects like: { lat: 1.100, lng: 59.00 }
 *  
 * @param  {Object} fromLocation
 * @param  {Object} toLocation
 * 
 * @return {number}
 */
function haversineKm(fromLocation, toLocation) {

  const radius_of_earth_kms = 6371;

  const dLat = deg2rad((fromLocation.lat - toLocation.lat));
  const dLng = deg2rad((fromLocation.lng - toLocation.lng));

  const a =  Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLng/2) 
        * Math.sin(dLng/2) * Math.cos(deg2rad(fromLocation.lat)) 
        * Math.cos(deg2rad(toLocation.lat));

  const c = 2 * Math.asin(Math.sqrt(a));

  return radius_of_earth_kms * c;

}

/**
 * Finds the radius of the circle which would fully enclose the current map
 *
 * @param  {google.maps.LatLngBounds} bounds   The google maps bounds object
 * 
 * @return {number}
 */
function calculateRadiusFromMapBounds(bounds) {

  // get the corners
  const pointNE = bounds.getNorthEast();
  const pointNELatLng = {
    lat: pointNE.lat(),
    lng: pointNE.lng()
  };
  const pointSW = bounds.getSouthWest();
  const pointSWLatLng = {
    lat: pointSW.lat(),
    lng: pointSW.lng()
  };

  // calculate the diagonal
  const diagonalDistanceKm = haversineKm(
    pointNELatLng,
    pointSWLatLng
  );

  // radius is half the diagonal
  return diagonalDistanceKm / 2;
}

/**
 * Returns a an object for the bounds NE/SW bounds which fits inside a circle
 * at point center with radius radius (in m)
 * 
 * @param  {number} radius The radius in m
 * @param  {Object} center object representing the center
 * 
 * @return {Object}
 */
function getNESWBoundsFromRadiusAndCenter(radius, center) {

  const earthRadiusM = 6378137;

  const pointNE = computeDestinationPoint(
    center.lat, 
    center.lng, 
    radius, 
    45, 
    earthRadiusM
  );

  const pointSW = computeDestinationPoint(
    center.lat, 
    center.lng, 
    radius, 
    225, 
    earthRadiusM
  );

  return {
    'ne': pointNE,
    'sw': pointSW
  };

}

/**
 * As above, but for NW and SE
 * 
 * @param  {number} radius The radius in m
 * @param  {Object} center object representing the center
 * 
 * @return {Object}
 */
function getNWSEBountsFromRadiusAndCenter(radius, center) {

  const earthRadiusM = 6378137;

  const pointNW = computeDestinationPoint(
    center.lat, 
    center.lng, 
    radius, 
    315, 
    earthRadiusM
  );

  const pointSE = computeDestinationPoint(
    center.lat, 
    center.lng, 
    radius, 
    135,
    earthRadiusM
  );

  return {
    'nw': pointNW,
    'se': pointSE
  };

}

/**
 * Computes the destination point given an initial point, a distance
 * and a bearing
 *
 * See http://www.movable-type.co.uk/scripts/latlong.html for the original code
 *
 * @param  {number} lat         latitude of the initial point in degree
 * @param  {number} lon         longitude of the initial point in degree
 * @param  {number} distance    distance to go from the initial point in meter
 * @param  {number} bearing     bearing in degree of the direction to go, e.g.
 *                                0 = north, 180 = south
 * @param  {number} radius      mean radius of the earth (in meters)
 * 
 * @return       object         { latitude: destLat  longitude: destLng }
 */
function computeDestinationPoint(lat, lon, distance, bearing, radius) {
  
  var delta = Number(distance) / radius; // angular distance in radians
  var theta = deg2rad(Number(bearing));

  var phi1 = deg2rad(Number(lat));
  var lambda1 = deg2rad(Number(lon));

  var phi2 = Math.asin( Math.sin(phi1)*Math.cos(delta) +
    Math.cos(phi1)*Math.sin(delta)*Math.cos(theta) );

  var lambda2 = lambda1 
    + Math.atan2(
      Math.sin(theta)*Math.sin(delta)*Math.cos(phi1),
      Math.cos(delta)-Math.sin(phi1)*Math.sin(phi2)
    );

  // normalise to -180..+180°
  lambda2 = (lambda2+3*Math.PI) % (2*Math.PI) - Math.PI; 

  return {lat: rad2deg(phi2), lng: rad2deg(lambda2)};
}

/**
 * Determines if a point is within a NE/SW boundary
 
 * @param  {Object}  point    
 * @param  {Object}  boundary 
 * 
 * @return {Boolean}
 */
function isLatAndLngInRectBoundary(point, boundary) {

  // handling for the rare occasion where we might go from 359deg to 0deg on 
  // international date line
  const eastBound = point.lng < boundary.NE.lng;
  const westBound = point.lng > boundary.SW.lng;

  var inLng;

  if (boundary.NE.lng < boundary.SW.lng) {
    inLng = eastBound || westBound;
  } else {
    inLng = eastBound && westBound;
  }

  var inLat = point.lat > boundary.SW.lat && point.lat < boundary.NE.lat;

  return inLat && inLng;
}

module.exports = {
  deg2rad,
  rad2deg,
  haversineKm,
  calculateRadiusFromMapBounds,
  getNESWBoundsFromRadiusAndCenter,
  getNWSEBountsFromRadiusAndCenter,
  computeDestinationPoint,
  isLatAndLngInRectBoundary
};