import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AssigneeAvatarsProps {
  people: { key: number | string; name: string; positionName?: string | null }[];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Deterministic hue per name so the same person keeps the same avatar color.
function avatarStyle(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return { backgroundColor: `hsl(${hash} 70% 90%)`, color: `hsl(${hash} 60% 28%)` };
}

export function AssigneeAvatars({ people }: AssigneeAvatarsProps) {
  if (people.length === 0) {
    return <p className="text-sm text-muted-foreground">Ninguém escalado</p>;
  }

  return (
    <ul className="space-y-2">
      {people.map((person) => (
        <li key={person.key} className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs font-medium" style={avatarStyle(person.name)}>
              {initials(person.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{person.name}</p>
            {person.positionName && (
              <p className="truncate text-xs text-muted-foreground">{person.positionName}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
