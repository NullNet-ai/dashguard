import { UserIcon } from '@heroicons/react/24/solid';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarPlaceholder,
  AvatarStatus,
  AvatarWithText
} from "~/components/ui/avatar"


export function AvatarExamples() {
  // Define sizes for consistent use across examples
  const sizes = ["2xs", "xs", "sm", "md", "lg", "xl"] as const;
  



  return (
    <div className="grid grid-cols-3 p-10 gap-5">
      {/* Circular Avatars */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Avatars</h3>
        <div className="flex items-center gap-4">
          {sizes.map((size) => (
            <Avatar key={`avatar-${size}`} size={size}>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Circular Avatars With Top Notification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Avatars With Top Notification</h3>
        <div className="flex items-center gap-4">
          {sizes.map((size) => (
            <Avatar 
              key={`avatar-top-${size}`} 
              size={size} 
              statusProps={{ status: "online", position: 'top-right'}}
            >
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Circular Avatars With Bottom Notification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Avatars With Bottom Notification</h3>
        <div className="flex items-center gap-4">
          {sizes.map((size) => (
            <Avatar 
              key={`avatar-bottom-${size}`} 
              size={size} 
              statusProps={{ status: "online", position: 'bottom-right'}}
            >
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Circular Placeholder Icon */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Placeholder Icon</h3>
        <div className="flex items-center gap-4">
          {sizes.map((size) => (
            <Avatar key={`placeholder-${size}`} size={size}>
              <AvatarPlaceholder icon={<UserIcon className='text-[#c2cedc]'  />} />
            </Avatar>
          ))}
        </div>
      </div>

      {/* Circular Placeholder Icon With Top Notification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Placeholder Icon With Top Notification</h3>
        <div className="flex items-center gap-4">
          {sizes.map((size) => (
            <Avatar 
              key={`placeholder-top-${size}`} 
              size={size} 
              statusProps={{ status: "online", position: 'top-right' }}
            >
              <AvatarPlaceholder icon={<UserIcon className='text-[#c2cedc]'  />} />
            </Avatar>
          ))}
        </div>
      </div>

      {/* Circular Placeholder Icon With Bottom Notification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Placeholder Icon With Bottom Notification</h3>
        <div className="flex items-center gap-4">
          {sizes.map((size) => (
            <Avatar 
              key={`placeholder-bottom-${size}`} 
              size={size} 
              statusProps={{ status: "online", position: 'bottom-right' }}
            >
              <AvatarPlaceholder icon={<UserIcon className='text-[#c2cedc]'  />} />
            </Avatar>
          ))}
        </div>
      </div>

      {/* Circular Avatar Initials */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Avatar Initials</h3>
        <div className="flex items-center gap-4">
          <Avatar size="md">
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Circular Avatars Initials With Top Notification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Avatars Initials With Top Notification</h3>
        <div className="flex items-center gap-4">
          <Avatar size="md" statusProps={{ status: "online", position: 'top-right' }}>
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Circular Avatars Initials With Bottom Notification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Avatars Initials With Bottom Notification</h3>
        <div className="flex items-center gap-4">
          <Avatar size="md" statusProps={{ status: "online", position: 'bottom-right'}}>
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Avatar Group Stack Bottom To Top */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatar Group Stack Bottom To Top</h3>
        <AvatarGroup direction="row" overlap={0.5} reverse>
          {Array(5).fill(0).map((_, index) => (
            <Avatar key={`group-bottom-to-top-${index}`} size="md">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {/* Avatar Group Stack Top To Bottom */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatar Group Stack Top To Bottom</h3>
        <AvatarGroup direction="row" overlap={0.5}>
          {Array(5).fill(0).map((_, index) => (
            <Avatar key={`group-top-to-bottom-${index}`} size="md">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {/* Avatar Group with Limit */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatar Group with Limit (max 3)</h3>
        <AvatarGroup direction="row" overlap={0.2} max={3} limit={true}>
          {Array(8).fill(0).map((_, index) => (
            <Avatar key={`group-limit-${index}`} size="md">
              <AvatarImage src={`https://i.pravatar.cc/150?img=${index + 10}`} alt={`Avatar ${index}`} />
              <AvatarFallback>{`U${index}`}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {/* Avatar Group Stack Vertical Bottom To Top */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatar Group Stack Vertical Bottom To Top</h3>
        <AvatarGroup direction="column" overlap={0.5} reverse>
          {Array(5).fill(0).map((_, index) => (
            <Avatar key={`group-vertical-bottom-to-top-${index}`} size="md">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {/* Avatar Group Stack Vertical Top To Bottom */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatar Group Stack Vertical Top To Bottom</h3>
        <AvatarGroup direction="column" overlap={0.5}>
          {Array(5).fill(0).map((_, index) => (
            <Avatar key={`group-vertical-top-to-bottom-${index}`} size="md">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {/* Avatar Group Vertical with Limit */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatar Group Vertical with Limit (max 3)</h3>
        <AvatarGroup direction="column" overlap={0.2} max={3} limit={true}>
          {Array(8).fill(0).map((_, index) => (
            <Avatar key={`group-vertical-limit-${index}`} size="md">
              <AvatarImage src={`https://i.pravatar.cc/150?img=${index + 20}`} alt={`Avatar ${index}`} />
              <AvatarFallback>{`U${index}`}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {/* Avatar With Text */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatar With Text</h3>
        <AvatarWithText text="Tom Cook">
          <Avatar size="md">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
        </AvatarWithText>
      </div>
    </div>
  )
}