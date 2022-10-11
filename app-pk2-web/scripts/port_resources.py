import os
from subprocess import check_call, check_output
import glob
import shutil
from os.path import join
from PIL import Image

src_path = os.path.realpath(
    os.path.join(os.path.realpath(__file__), "..", "..", "pk2-orig-res"))
file_path = os.path.realpath(
    os.path.join(os.path.realpath(__file__), "..", "..", "res"))


def main(src=src_path, dst=file_path):
    os.makedirs(join(dst, "music"), exist_ok=True)
    for x in glob.glob(join(src, "music", "*.xm")):
        dst_file = join(dst, "music", os.path.basename(x)[:-3] + ".mp3")
        if not os.path.exists(dst_file):
            check_call(["ffmpeg", "-i", x, dst_file], )

    os.makedirs(join(dst, "blocks"), exist_ok=True)
    for x in glob.glob(join(src, "gfx/tiles", "*.bmp")):
        dst_dir_name = os.path.basename(x)[:-4]
        os.makedirs(join(dst, "blocks", dst_dir_name), exist_ok=True)

        check_call([
            "convert", "-crop", "32x32", x,
            join(dst, "blocks", dst_dir_name, "%03d.png")
        ])

        # Replace bmp's the transparent color with real PNG transparency
        # Apparently does not work when included in above command
        for y in glob.glob(join(dst, "blocks", dst_dir_name, "*.png")):
            check_call([
                "convert",
                y,
                "-fuzz",
                "10%",  # some files have not-exactly matching color(but not these AFAIK)
                "-transparent",
                "#94d1de",
                y,
            ])

    os.makedirs(join(dst, "scenery"), exist_ok=True)
    for x in glob.glob(join(src, "gfx/scenery", "*.bmp")):
        os.makedirs(join(dst, "scenery"), exist_ok=True)

        check_call([
            "convert", x,
            join(dst, "scenery", os.path.basename(x)[:-4] + ".png")
        ])

    os.makedirs(join(dst, "models"), exist_ok=True)
    os.makedirs(join(dst, "models/data"), exist_ok=True)
    for x in glob.glob(join(src, "sprites", "*.spr")):
        fn = os.path.basename(x)

        shutil.copy(x, join(dst, "models/data", fn))

    os.makedirs(join(dst, "models/sprites"), exist_ok=True)
    for x in glob.glob(join(src, "sprites", "*.bmp")):
        fn = os.path.basename(x)[:-4]

        y = join(dst, "models/sprites", fn + ".png")
        check_call(["convert", x, y])

        check_call([
            "convert",
            y,
            "-fuzz",
            "10%",  # some files have not-exactly matching color
            "-transparent",
            "#94d1de",
            y,
        ])

    os.makedirs(join(dst, "models/sfx"), exist_ok=True)
    for x in glob.glob(join(src, "sprites", "*.wav")):
        fn = os.path.basename(x)[:-4]

        y = join(dst, "models/sfx", fn + ".mp3")
        if not os.path.exists(y):
            check_call(["ffmpeg", "-i", x, y])


if __name__ == "__main__":
    main()