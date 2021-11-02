const tl = gsap.timeline({delay: 1, duration: .3});

gsap.set(['.hero-heading', '.item-1', '.item-2', '.item-3', '.container__img'], {autoAlpha: 0});
tl.to(".hero-heading", {
    autoAlpha: 1
  })
  .to(".item-1", {
    autoAlpha: 1
  })
  .to(".item-2", {
   autoAlpha: 1
  })
  .to(".item-3", {
    autoAlpha: 1
   })
  .to(".container__img", {
    autoAlpha: 1
  });
