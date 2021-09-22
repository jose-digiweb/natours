/* eslint-disable */
import '@babel/polyfill';

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9zZWRpZ2l3ZWIiLCJhIjoiY2t0cHF5eGFhMHA4czJucXVoMG8xN282ayJ9._UUCErr9TLVYdugd_-D2fQ';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/josedigiweb/cktpvzqmh2mc418kk8u7ei9xk',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // CREATE A MARKER
    const el = document.createElement('div');
    el.className = 'marker';

    // ADD THE MARKER
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // ADD THE POPUP
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // EXTEND MAP TO INCLUDE THE CURRENT LOCATION
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 100,
      left: 100,
      right: 100,
    },
  });
};
