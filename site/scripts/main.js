import 'site/styles/main.scss';
import registerImageZoomer from 'lib/image-zoomer';

[
  registerImageZoomer
].forEach((fn) => fn());
