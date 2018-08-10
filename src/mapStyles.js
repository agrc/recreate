import config from './config';
import fs from 'react-native-fs';


let styleLoaded = false;

export default {
  getBasemapStyle: async function(component) {
    console.log('getBasemapStyle');

    if (styleLoaded) {
      component.setState({ styleLoaded: true });
      return;
    }

    const response = await fetch(config.urls.terrainStyleFile);

    const onError = (error) => {
      console.error(error.message);
    }

    if (!response.ok) {
      onError(response.error);
    } else {
      let style = await response.json();

      // replace relative URLs with absolute since mapbox doesn't support them
      style.sprite = style.sprite.replace('..', `${config.urls.baseMapTiles}/resources`);
      style.glyphs = style.glyphs.replace('..', `${config.urls.baseMapTiles}/resources`);
      style.sources.esri.tiles[0] = style.sources.esri.tiles[0].replace('../..', `${config.urls.baseMapTiles}`);
      console.log(style);

      try {
        const exists = await fs.exists(this.styleFileURI);
        if (exists) {
          await fs.unlink(this.styleFileURI);
        }

        await fs.writeFile(this.styleFileURI, JSON.stringify(style));

        component.setState({ styleLoaded: true });
        styleLoaded = true;
      }
      catch (error) {
        onError(error);
      }
    }
  },
  styleFileURI: `file://${fs.DocumentDirectoryPath}/style.json`
}
