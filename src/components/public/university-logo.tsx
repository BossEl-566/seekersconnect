import Image from "next/image";


type UniversityLogoProps = {
  code:
    string;

  name:
    string;

  className?:
    string;

  imageClassName?:
    string;
};


function getUniversityLogo(
  code:
    string,

  name:
    string,
) {
  const normalizedCode =
    code
      .trim()
      .toUpperCase();


  const normalizedName =
    name
      .trim()
      .toLowerCase();


  // UCC Distance Education / College of Distance Education
  if (
    normalizedName.includes(
      "distance",
    )
  ) {
    return "/ucc-distance-logo.png";
  }


  switch (
    normalizedCode
  ) {
    case "UCC":
      return "/ucc-logo.png";


    case "UEW":
      return "/uew-logo.png";


    case "UG":
      return "/university-of-ghana.png";


    case "KNUST":
      return "/knust-logo.png";


    case "UDS":
      return "/university-of-development-studies.png";


    default:
      return "/seekersconnect-logo.jpg";
  }
}


export function UniversityLogo({
  code,
  name,
  className = "",
  imageClassName = "",
}: UniversityLogoProps) {
  const logo =
    getUniversityLogo(
      code,
      name,
    );


  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}
    >
      <Image
        src={
          logo
        }
        alt={`${name} logo`}
        fill
        sizes="96px"
        className={`object-contain p-2 ${imageClassName}`}
      />
    </div>
  );
}