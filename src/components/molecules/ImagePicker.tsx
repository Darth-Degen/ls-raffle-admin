import { Dispatch, SetStateAction, FC, HTMLAttributes } from "react";

interface PickerProps extends HTMLAttributes<HTMLDivElement> {
  imageArr: any[];
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
}
const ImagePicker: FC<PickerProps> = (props: PickerProps) => {
  const { imageArr, selected, setSelected, className } = props;

  // const [selected, setSelected] = useState<number>(0);

  return (
    <>
      {imageArr.length > 1 && (
        <div
          className={`px-3 h-8 lg:h-6 flex items-center justify-center gap-3 absolute bottom-6 left-1/2 transform -translate-x-1/2 rounded-full bg-opacity-50 bg-gray-500 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {imageArr.map((item, index) => (
            <div
              className={`w-5 h-5 lg:w-3 lg:h-3 rounded-full  transition-all duration-300 cursor-pointer ${
                index === selected ? "bg-gray-500" : "bg-white"
              }`}
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(index);
              }}
            ></div>
          ))}
        </div>
      )}
    </>
  );
};

export default ImagePicker;
