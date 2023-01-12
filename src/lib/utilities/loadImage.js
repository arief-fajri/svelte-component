export const renderImages = () => {
	if (typeof IntersectionObserver !== 'undefined') {
		let imagesToLoad = document.querySelectorAll('img[data-src]');
		const observer = new IntersectionObserver(entries => {
			entries.forEach((item) => {
				const image = item.target
				if (item.isIntersecting) {
					image.setAttribute('src', image.getAttribute('data-src'));
					return
				}

				if(image.getAttribute('data-low')){
					if(image.getAttribute('data-low') !== image.getAttribute('src')){
						image.setAttribute('src', image.getAttribute('data-low'));
					}
				}
			});
		}, {threshold: .3});
		
		imagesToLoad.forEach((img) => {
			img.setAttribute('data-low', img.getAttribute('src'));
			observer.observe(img);
		});
	}
};
