import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail,
  Users,
  MessageSquare,
  BookOpen,
  MapPin,
  Sparkles,
  ArrowRight,
  Trophy,
  Flame,
  Loader2,
} from "lucide-react";

interface PublicProfile {
  name: string;
  location: string | null;
  county: string | null;
  bio: string | null;
  avatar_url: string | null;
  eco_points: number;
  streak: number;
  top_concern: string | null;
  letters_sent: number;
  swarms_joined: number;
  posts_created: number;
  courses_completed: number;
}

export function PublicImpactScreen() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swarms, setSwarms] = useState<{ name: string; category: string }[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("Invalid profile link");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch public profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(
            "name, location, county, bio, avatar_url, eco_points, streak, top_concern, letters_sent, swarms_joined, posts_created, courses_completed",
          )
          .eq("user_id", userId)
          .single();

        if (profileError || !profileData) {
          setError("EcoWarrior not found");
          setIsLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch swarms user has joined
        const { data: memberships } = await supabase.from("swarm_memberships").select("swarm_id").eq("user_id", userId);

        if (memberships && memberships.length > 0) {
          const swarmIds = memberships.map((m) => m.swarm_id);
          const { data: swarmsData } = await supabase.from("swarms").select("name, category").in("id", swarmIds);

          if (swarmsData) {
            setSwarms(swarmsData);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleJoinMovement = () => {
    navigate("/signup");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-24 h-24 rounded-full eco-gradient-bg flex items-center justify-center mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{error || "Profile Not Found"}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          This EcoWarrior profile doesn't exist, but you can still join the movement and make your own impact!
        </p>
        <button onClick={handleJoinMovement} className="eco-button-primary py-4 px-8 text-lg flex items-center gap-2">
          Join the Movement
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const statItems = [
    { icon: Mail, value: profile.letters_sent || 0, label: "Letters Sent", color: "text-secondary" },
    { icon: Users, value: profile.swarms_joined || 0, label: "Swarms Joined", color: "text-eco-gold" },
    { icon: MessageSquare, value: profile.posts_created || 0, label: "Stories Shared", color: "text-eco-orange" },
    { icon: BookOpen, value: profile.courses_completed || 0, label: "Courses Done", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="eco-gradient-bg px-6 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 text-center">
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/30 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold text-white border-4 border-white/30 mb-4">
              {profile.name.charAt(0)}
            </div>
          )}

          <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>

          {(profile.location || profile.county) && (
            <p className="text-white/80 flex items-center justify-center gap-1 mb-2">
              <MapPin className="w-4 h-4" />
              {profile.location || profile.county}
            </p>
          )}

          {profile.bio && <p className="text-white/70 text-sm max-w-md mx-auto mb-4">{profile.bio}</p>}

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-eco-orange" />
              <span className="text-white font-semibold">{profile.streak} Day Streak</span>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-eco-gold" />
              <span className="text-white font-semibold">{profile.eco_points} EcoPoints</span>
            </div>
          </div>
        </div>
      </div>

      {/* EcoPoints Badge Card */}
      <div className="px-6 -mt-8 relative z-20">
        <div className="eco-card-elevated p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Impact Statistics</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            See the positive change {profile.name.split(" ")[0]} is making
          </p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Impact Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((stat) => (
            <div key={stat.label} className="eco-stat-card">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground text-center">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Swarms Joined */}
        {swarms.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-eco-gold" />
              Active Swarms
            </h3>
            <div className="space-y-2">
              {swarms.map((swarm, idx) => (
                <div key={idx} className="eco-card p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{swarm.name}</p>
                    <p className="text-xs text-muted-foreground">{swarm.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Concern */}
        {profile.top_concern && (
          <div className="eco-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Passionate About</p>
            <p className="font-semibold text-foreground">{profile.top_concern}</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="eco-card-elevated p-6 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
          <div className="w-16 h-16 rounded-full eco-gradient-bg mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Ready to Make Your Impact?</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Join thousands of EcoWarriors across Kenya. Create your profile, earn EcoPoints, and drive change!
          </p>
          <button
            onClick={handleJoinMovement}
            className="eco-button-primary py-4 px-8 text-lg flex items-center gap-2 mx-auto"
          >
            Join the Movement
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4">🌍 EcoSwarm - Your Digital Agora</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-6 px-6">
        <p>© 2026 EcoSwarm.</p>
      </div>
    </div>
  );
}
