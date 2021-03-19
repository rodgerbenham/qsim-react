# Query Visualization Tool Demo [CHIIR 2021]

This is the repository for the CHIIR demo paper "Different Keystrokes for Different Folks: Visualizing Crowdworker Querying Behavior" from Benham et al. If you extend it or found it to be useful in some way, please consider citing the paper:

```latex
@inproceedings{benhamqsim,
  title={Different Keystrokes for Different Folks: {V}isualizing Crowdworker Querying Behavior},
  author={R. Benham and J. Mackenzie and J. S. Culpepper and A. Moffat},
  booktitle={Proc. CHIIR},
  pages={331--335},
  year={2021}
}
```

And the CIKM Resources paper from where the query data originated:

```latex
@inproceedings{mackenziecc,
  title={{CC}-{N}ews-{E}n: {A} Large {E}nglish News Corpus},
  author={J. Mackenzie and R. Benham and M. Petri and J. R. Trippas and J. S. Culpepper and A. Moffat},
  booktitle={Proc. CIKM},
  pages={3077--3084},
  year={2020}
}
```

## Architecture

We had the goal when designing the visualisation tool for it to be accessible across operating systems and devices, and to render text to the display as true to form to the timestamps as the user typed the queries. Additionally, we wanted to avoid server hosting fees. Although building a Unity application may have delivered better graphical performance, it would have inevitably involved limiting the accessibility of the tool. React combined with the `requestAnimationFrame()` Javascript API was a great middle-ground, as it turned out. React uses its own virtual DOM to avoid unnecessary re-rendering and re-painting of the UI when using the actual DOM ([see here to learn more](https://adhithiravi.medium.com/react-virtual-dom-explained-in-simple-english-fc2d0b277bc5)), and  `requestAnimationFrame()` is very similar to the game loop design pattern which is sensitive to the fact that the graphics card only gives you certain opportunities to perform work on the viewport, where using `setTimeout` often ends up out of sync with the reality of the keystrokes entered.

A react component `TopicViewer` is instantiated with the default topic id 1 (see the entry point at `src/App.js`, code for TopicViewer in `src/TopicViewer/TopicViewer.js`). The `TopicViewer` contains most of the global application state, including whether playback is enabled or paused, how many queries to display for the topic, and so on. The `TopicViewer` is also in charge of loading in the topic data and spawning `QueryInput` components, where each of those components keeps track of animation for its own individual query -- responding to changes in playback state from the `TopicViewer` if needed. When a topic change is requested (or the first topic is loaded), the JSON file with the corresponding topic ID is loaded in `public/joined/<topicid>.json` to avoid an initial 33MB download for all topic data (when viewing every topic every time the tool is loaded is highly unlikely). This topic data has been pre-processed from the CC-News-En resource ([see here](https://cloudstor.aarnet.edu.au/plus/s/M8BvXxe6faLZ4uE)), where the pre-processing applied to reduce file size has been described in this demo paper.

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), the details below will help you to spin up a local instance or build a production version. Note `make_prod.sh` where it adds a homepage entry to allow setting the root folder to `/ccnews-explorer/` for GitHub pages.

### Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
