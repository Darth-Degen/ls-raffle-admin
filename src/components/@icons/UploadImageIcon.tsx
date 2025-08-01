import { FC, SVGProps, useState } from "react";
import { motion } from "framer-motion";

interface Props extends SVGProps<SVGSVGElement> {
  fillHover?: string;
  color?: string;
  hoverColor?: string;
}

const UploadImageIcon: FC<Props> = (props: Props) => {
  const {
    hoverColor = "#c84e3a",
    className,
    color = "#d1d5db",
    ...componentProps
  } = props;

  const [didHover, setDidHover] = useState<boolean>(false);

  return (
    <div
      className="cursor-pointer transition-all duration-200 rounded h-min p-2"
      onMouseEnter={() => setDidHover(true)}
      onMouseLeave={() => setDidHover(false)}
    >
      <svg
        width={componentProps.width ?? 24}
        height={componentProps.height ?? 24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.0186 7.49538C2 8.22355 2 9.05222 2 9.99998V12H10.0971C9.76426 11.8433 9.40022 11.74 9.01534 11.7015L7 11.5H6.99999C5.68663 11.3686 5.02995 11.303 4.49718 11.087C3.36574 10.6283 2.50574 9.678 2.1619 8.50653C2.0787 8.22305 2.03826 7.91096 2.0186 7.49538ZM21.8742 5.77454L21.5 17C20.5396 17 19.6185 16.6184 18.9393 15.9393L17.8123 14.8123C17.4423 14.4422 17.2572 14.2572 17.0697 14.1385C16.4165 13.725 15.5835 13.725 14.9303 14.1385C14.7428 14.2572 14.5577 14.4422 14.1877 14.8123L13.4145 15.5854C12.8925 16.1074 12 15.7377 12 14.9995V22H14C17.7712 22 19.6569 22 20.8284 20.8284C22 19.6568 22 17.7712 22 14V9.99998C22 8.20741 22 6.84087 21.8742 5.77454Z"
          initial={{ fill: color }}
          animate={{ fill: didHover ? hoverColor : color }}
        />
        <motion.path
          d="M3 10C3 8.08611 3.00212 6.75129 3.13753 5.74416C3.26907 4.76579 3.50966 4.2477 3.87868 3.87868C4.2477 3.50966 4.76579 3.26907 5.74416 3.13753C6.75129 3.00212 8.08611 3 10 3H14C15.9139 3 17.2487 3.00212 18.2558 3.13753C19.2342 3.26907 19.7523 3.50966 20.1213 3.87868L20.8112 3.18882L20.1213 3.87868C20.4903 4.2477 20.7309 4.76579 20.8625 5.74416C20.9979 6.75129 21 8.08611 21 10V14C21 15.9139 20.9979 17.2487 20.8625 18.2558C20.7309 19.2342 20.4903 19.7523 20.1213 20.1213C19.7523 20.4903 19.2342 20.7309 18.2558 20.8625C17.2487 20.9979 15.9139 21 14 21H13V14C13 13.9818 13 13.9637 13 13.9456C13.0001 13.5215 13.0002 13.1094 12.9545 12.7695C12.903 12.3863 12.7774 11.949 12.4142 11.5858C12.051 11.2226 11.6137 11.097 11.2305 11.0455C10.8906 10.9998 10.4785 10.9999 10.0544 11C10.0363 11 10.0182 11 10 11H3V10Z"
          initial={{ stroke: color }}
          animate={{ stroke: didHover ? hoverColor : color }}
          strokeWidth="2"
        />
        <circle cx="16" cy="8" r="2" fill="#222222" />
        <motion.path
          d="M8 16V15H9V16H8ZM3.62469 20.7809C3.19343 21.1259 2.56414 21.056 2.21913 20.6247C1.87412 20.1934 1.94404 19.5641 2.37531 19.2191L3.62469 20.7809ZM7 21V16H9V21H7ZM8 17H3V15H8V17ZM8.6247 16.7809L3.62469 20.7809L2.37531 19.2191L7.3753 15.2191L8.6247 16.7809Z"
          initial={{ fill: color }}
          animate={{ fill: didHover ? hoverColor : color }}
        />
      </svg>
    </div>
  );
};

export default UploadImageIcon;
