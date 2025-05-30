# markopolo.github.io
Landing page

## Image Vectorization

```shell
uv run --with opencv-python --with numpy --with Pillow python vectorize_image.py
```

## Text vectorization

```shell
uv run --with fonttools --with svgpathtools --with svgwrite python text_to_svg.py \
       "Marko Polo Research Lab" --font assets/GreatVibes-Regular.ttf --out title.svg
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
