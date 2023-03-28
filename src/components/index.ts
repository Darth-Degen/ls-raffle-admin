import dynamic from "next/dynamic";

//icons
const ArrowIcon = dynamic(()=> import("./@icons/ArrowIcon"))
const TwitterIcon = dynamic(()=> import("./@icons/TwitterIcon"))
const DiscordIcon = dynamic(()=> import("./@icons/DiscordIcon"))
const MenuIcon = dynamic(()=> import("./@icons/MenuIcon"))
const LeftArrowIcon = dynamic(()=> import("./@icons/LeftArrowIcon"))
const RightArrowIcon = dynamic(()=> import("./@icons/RightArrowIcon"))
//atoms
const NumberInput = dynamic(()=> import("./atoms/NumberInput"))
const TextInput = dynamic(()=> import("./atoms/TextInput"))
const Button = dynamic(()=> import("./atoms/Button"))
const CheckBox = dynamic(()=> import("./atoms/CheckBox"))
const LoadAnimation = dynamic(()=> import("./atoms/LoadAnimation"))
const LoadCircle = dynamic(()=> import("./atoms/LoadCircle"))
const ConnectButton = dynamic(() => import("./atoms/ConnectButton"))
const WalletButton = dynamic(() => import("./atoms/WalletButton"))
const SpinAnimation = dynamic(() => import("./atoms/SpinAnimation"))
//molecules
const PageHead = dynamic(()=> import("./molecules/PageHead"))
const Logo = dynamic(()=> import("./molecules/Logo"))
//organisms
const Header = dynamic(()=> import("./organisms/Header"))
const Footer = dynamic(()=> import("./organisms/Footer"))
//templates
const PageLayout = dynamic(()=> import("./templates/PageLayout"))

export {
  PageHead,
  Logo,
  Header, 
  Footer,
  PageLayout,
  ArrowIcon,
  NumberInput,
  TextInput,
  CheckBox,
  Button,
  LoadAnimation,
  TwitterIcon,
  DiscordIcon,
  LoadCircle,
  MenuIcon,
  LeftArrowIcon,
  RightArrowIcon,
  ConnectButton,
  WalletButton,
  SpinAnimation
}