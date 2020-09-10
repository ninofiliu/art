# Generative Art

Art made from code

### How does it work?

I'll soon write articles and make videos diving deep into how each algorithm work, but for now, I'll let you reverse engineer the code, it's surprisingly short!

### How to run it locally

This repository is just a static website, so just

1. Clone the repo
2. Serve it locally on port 8080, for example with `python -m http.server 8080`
3. Go to [/algorithms](http://localhost:8080)
4. Click on any of the algorithm to see a form expand
5. Tweak the parameters, and click go to start the image generation
   - `src` is the source image URL, it can be from one of the images included in this repo like [/source-images/eye.jpg](./source-images/eye.jpg), or an absolute URL like [https://storage.googleapis.com/nino-filiu-static/163.jpg](https://storage.googleapis.com/nino-filiu-static/163.jpg)
   - `batch` is the amount of algorithms steps performed between each render. The bigger, the faster the image forms, but the generation might become laggy
   - for the other parameters, take a look at the code, often their meaning is quite self-evident
6. Images are the accessible by URLs, some of my faves are:
   - http://localhost:8080/algorithms/spiral.html?src=%2Fsource-images%2Fred-lips.jpg&batch=200&stop=looped&stopBasic=0.5&stopLinearDivider=5&stopLoopedMultiplier=5&stopLoopedDivider=10&stopAt=0.4
   - http://localhost:8080/algorithms/spiral-colors/?src=%2Fsource-images%2Frenaissance.jpg&batch=200&stop=basic&stopBasic=0.4&stopLinearDivider=5&stopLoopedMultiplier=5&stopLoopedDivider=10&stopAt=0.5
   - http://localhost:8080/algorithms/spiral-image/?src=%2Fsource-images%2Feye.jpg&batch=500&stop=linear&stopBasic=0.5&stopLinearDivider=5&stopLoopedMultiplier=5&stopLoopedDivider=10&stopAt=0.5
