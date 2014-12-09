#! bash
for i in `ls *.pdf`; do
filepart="${i%.*}";
pamtosvg ${filepart}-0007.ppm > ${filepart}-7.html
pamtosvg ${filepart}-0009.ppm > ${filepart}-9.html
done
