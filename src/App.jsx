import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import PostScheduler from './components/PostScheduler';
import PostQueue from './components/PostQueue';
import ChannelConnections from './components/ChannelConnections';
import Settings from './components/Settings';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { createClient } from '@supabase/supabase-js';
import { Database, Terminal } from 'lucide-react';

function MainApp() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [supabase, setSupabase] = useState(null);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);
  const [dbError, setDbError] = useState(null);

  // Seed default Channels
  const [channels, setChannels] = useState(() => {
    const saved = localStorage.getItem('supabase-social-channels');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Twitter / X', type: 'twitter', connected: true, handle: '@contra_hq', followers: 12400, avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80' },
      { id: '2', name: 'LinkedIn Page', type: 'linkedin', connected: true, handle: 'Contra', followers: 8200, avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80' },
      { id: '3', name: 'Instagram Business', type: 'instagram', connected: false, handle: '', followers: 4200, avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
      { id: '4', name: 'Facebook Page', type: 'facebook', connected: false, handle: '', followers: 5800, avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    ];
  });

  // Seed default Posts
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('supabase-social-posts');
    if (saved) return JSON.parse(saved);
    
    // Default posts
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const pastDay = new Date();
    pastDay.setDate(pastDay.getDate() - 2);

    return [
      {
        id: 'post_1',
        content: 'Introducing Contra — the cleanest way to manage, schedule, and publish across all your social channels. ⚡🚀 #contra #socialmedia',
        platforms: ['twitter', 'linkedin'],
        media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        status: 'scheduled',
        scheduled_at: oneHourFromNow.toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'post_2',
        content: 'Cloudinary + Contra = seamless media uploads straight from the composer. Attach images and go live instantly. 📸 #contra #cloudinary',
        platforms: ['twitter'],
        media_url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80',
        status: 'scheduled',
        scheduled_at: oneDayFromNow.toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'post_3',
        content: 'Clean UI, tight layout, and zero friction. Contra keeps your social workflow focused and fast. 🟢💻 #webdev #productdesign',
        platforms: ['linkedin'],
        media_url: null,
        status: 'published',
        scheduled_at: pastDay.toISOString(),
        created_at: pastDay.toISOString()
      }
    ];
  });

  // Persist local state changes when credentials aren't configured
  useEffect(() => {
    if (!isUsingSupabase) {
      localStorage.setItem('supabase-social-posts', JSON.stringify(posts));
    }
  }, [posts, isUsingSupabase]);

  useEffect(() => {
    localStorage.setItem('supabase-social-channels', JSON.stringify(channels));
  }, [channels]);

  // Setup Supabase Client
  // Priority: VITE_ env vars → localStorage (Settings UI)
  const initializeSupabase = async () => {
    const envUrl  = import.meta.env.VITE_SUPABASE_URL;
    const envKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // If env vars are set, write them to localStorage so the Settings UI stays in sync
    if (envUrl)  localStorage.setItem('supabase-url', envUrl);
    if (envKey)  localStorage.setItem('supabase-key', envKey);

    const url = envUrl || localStorage.getItem('supabase-url');
    const key = envKey || localStorage.getItem('supabase-key');

    setDbError(null);

    if (url && key) {
      try {
        const client = createClient(url, key);
        setSupabase(client);
        setIsUsingSupabase(true);
        console.log('Supabase client successfully initialized!');

        try {
          // Fetch channels
          const { data: channelsData, error: chanError } = await client.from('channels').select('*');
          if (!chanError && channelsData) {
            if (channelsData.length > 0) {
              setChannels(channelsData);
            } else {
              // Table is empty, seed it
              const defaultChannels = [
                { id: '1', name: 'Twitter / X', type: 'twitter', connected: true, handle: '@contra_hq', followers: 12400 },
                { id: '2', name: 'LinkedIn Page', type: 'linkedin', connected: true, handle: 'Contra', followers: 8200 },
                { id: '3', name: 'Instagram Business', type: 'instagram', connected: false, handle: '', followers: 4200 },
                { id: '4', name: 'Facebook Page', type: 'facebook', connected: false, handle: '', followers: 5800 },
              ];
              await client.from('channels').insert(defaultChannels);
              setChannels(defaultChannels);
            }
          } else if (chanError) {
            console.warn("Could not load channels from Supabase (have you run the SQL schema?):", chanError.message);
            setDbError('Table not found. Have you run the SQL schema in your Supabase SQL Editor?');
          }

          // Fetch posts
          const { data: postsData, error: postsError } = await client.from('posts').select('*').order('created_at', { ascending: false });
          if (!postsError && postsData) {
            setPosts(postsData);
          } else if (postsError) {
            console.warn("Could not load posts from Supabase (have you run the SQL schema?):", postsError.message);
          }
        } catch (dbErr) {
          console.error("Database query failed:", dbErr);
          setDbError(dbErr.message);
        }
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        setDbError('Invalid credentials. Check your Supabase URL and Anon Key.');
        setIsUsingSupabase(false);
      }
    } else {
      setIsUsingSupabase(false);
      setSupabase(null);
    }
  };

  useEffect(() => {
    initializeSupabase();

    // Check for successful OAuth connection redirect query param
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      addToast('Channel connected!', 'success', 'Your Twitter account has been authorized and linked successfully.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handlers
  const handleAddPost = async (newPost) => {
    const { publishImmediately, ...postData } = newPost;

    if (isUsingSupabase && supabase) {
      const { data, error } = await supabase.from('posts').insert([postData]).select();
      if (error) {
        console.error('Error inserting post to Supabase:', error);
        addToast('Failed to save post', 'error', error.message);
      } else if (data && data[0]) {
        const savedPost = data[0];
        setPosts([savedPost, ...posts]);

        // If the user clicked "Publish Now" and Twitter is connected, call the Edge Function
        const isTwitterPost = savedPost.platforms && savedPost.platforms.includes('twitter');
        const twitterConnected = channels.find(c => c.type === 'twitter')?.connected;

        if (publishImmediately && isTwitterPost && twitterConnected) {
          addToast('Publishing to Twitter...', 'info', 'Sending your post live.');
          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase-url');
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase-key');

            const res = await fetch(`${supabaseUrl}/functions/v1/publish-post`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
              },
              body: JSON.stringify({ postId: savedPost.id }),
            });

            const result = await res.json();
            if (!res.ok || result.error) throw new Error(result.error || 'Publishing failed');

            setPosts(prev => prev.map(p => p.id === savedPost.id ? { ...p, status: 'published' } : p));
            addToast('Post published! 🎉', 'success', 'Your tweet is now live on Twitter.');
          } catch (err) {
            console.error('Publish post error:', err);
            addToast('Saved but publish failed', 'error', err.message);
          }
        } else if (publishImmediately) {
          addToast('Published!', 'success', 'Post marked as live.');
        } else {
          addToast('Post scheduled', 'success', 'Saved to Supabase successfully.');
        }
      }
    } else {
      setPosts([postData, ...posts]);
      addToast(publishImmediately ? 'Published! (Demo)' : 'Post added', 'success', 'Saved locally (Demo Mode).');
    }
  };

  const handleEditPost = async (id, updates) => {
    if (isUsingSupabase && supabase) {
      const { error } = await supabase.from('posts').update(updates).eq('id', id);
      if (error) {
        addToast('Update failed', 'error', error.message);
      } else {
        setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p));
        addToast('Post updated', 'success', 'Your changes have been saved.');
      }
    } else {
      setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p));
      addToast('Post updated', 'success', 'Changes saved locally.');
    }
  };

  const handleDeletePost = async (id) => {
    if (isUsingSupabase && supabase) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) {
        console.error(`Error deleting post ${id} from Supabase:`, error);
        addToast('Delete failed', 'error', error.message);
      } else {
        setPosts(posts.filter(p => p.id !== id));
        addToast('Post deleted', 'success');
      }
    } else {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handlePublishPost = async (id) => {
    const nowStr = new Date().toISOString();
    const post = posts.find(p => p.id === id);
    const isTwitterPost = post && post.platforms && post.platforms.includes('twitter');
    const twitterConnected = channels.find(c => c.type === 'twitter')?.connected;


    if (post.platforms.includes('twitter')) {
      try {
        const funcUrl = import.meta.env.VITE_SUPABASE_URL 
          ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publish-post`
          : null;

        if (!funcUrl) {
          throw new Error('Supabase function URL not configured');
        }

        addToast('Publishing to Twitter...', 'info', 'Sending secure request to Edge Function');

        // If it was a composer submit, we might not have saved it to DB yet
        if (isUsingSupabase && supabase && postObject) {
          await supabase.from('posts').insert([{
            id: post.id,
            content: post.content,
            platforms: post.platforms,
            media_url: post.media_url,
            status: 'scheduled', // temporary
            scheduled_at: post.scheduled_at
          }]);
        }

        const res = await fetch(funcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase-key')}`
          },
          body: JSON.stringify({ postId: id }),
        });

        const result = await res.json();
        
        if (!res.ok || result.error) throw new Error(result.error || 'Publishing failed');

        setPosts(posts.map(p => p.id === id ? { ...p, status: 'published', scheduled_at: nowStr } : p));
        addToast('Post published! 🎉', 'success', 'Your tweet is now live on Twitter.');
      } catch (err) {
        console.error('Publish post error:', err);
        addToast('Publish failed', 'error', err.message);
      }
    } else if (isUsingSupabase && supabase) {
      const { error } = await supabase.from('posts').update({ status: 'published', scheduled_at: nowStr }).eq('id', id);
      if (error) {
        console.error(`Error updating post ${id} status in Supabase:`, error);
        addToast('Publish failed', 'error', error.message);
      } else {
        setPosts(posts.map(p => p.id === id ? { ...p, status: 'published', scheduled_at: nowStr } : p));
        addToast('Post published', 'success');
      }
    } else {
      setPosts(posts.map(p => p.id === id ? { ...p, status: 'published', scheduled_at: nowStr } : p));
      addToast('Post published', 'success');
    }
  };

  const handleToggleChannel = async (id, connected, handle = '') => {
    let followers = 0;
    let avatar_url = null;
    if (connected) {
      const chan = channels.find(c => c.id === id);
      const type = chan ? chan.type : '';
      if (type === 'twitter') {
        followers = 12400;
        avatar_url = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80';
      } else if (type === 'linkedin') {
        followers = 8200;
        avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80';
      } else if (type === 'instagram') {
        followers = 4200;
        avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80';
      } else if (type === 'facebook') {
        followers = 5800;
        avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80';
      }
    }

    if (isUsingSupabase && supabase) {
      // Try updating all columns first
      let { error } = await supabase.from('channels').update({ connected, handle, followers, avatar_url }).eq('id', id);
      
      // Fallback 1: if fails, retry without avatar_url
      if (error) {
        console.warn("Avatar update failed, retrying without avatar_url:", error.message);
        let retry = await supabase.from('channels').update({ connected, handle, followers }).eq('id', id);
        error = retry.error;

        // Fallback 2: if still fails (e.g. followers column missing), retry with only base fields
        if (error) {
          console.warn("Followers update failed, retrying with only base fields:", error.message);
          const baseRetry = await supabase.from('channels').update({ connected, handle }).eq('id', id);
          error = baseRetry.error;
        }
      }

      if (error) {
        console.error(`Error updating channel ${id} in Supabase:`, error);
        addToast('Channel update failed', 'error', error.message);
      } else {
        setChannels(channels.map(c => c.id === id ? { ...c, connected, handle, followers, avatar_url } : c));
        addToast(connected ? 'Channel linked' : 'Channel disconnected', 'success');
      }
    } else {
      setChannels(channels.map(c => c.id === id ? { ...c, connected, handle, followers, avatar_url } : c));
      addToast(connected ? 'Channel linked' : 'Channel disconnected', 'success');
    }
  };

  const handleSaveCredentials = (credentials) => {
    initializeSupabase();
  };

  // Tab Breadcrumbs Lookup
  const getBreadcrumbs = () => {
    const formatLabel = (tab) => {
      if (tab === 'dashboard') return 'Dashboard';
      if (tab === 'scheduler') return 'Scheduler';
      if (tab === 'queue') return 'Posts Queue';
      if (tab === 'channels') return 'Channels';
      if (tab === 'settings') return 'Settings';
      return tab;
    };
    
    return (
      <div className="breadcrumbs">
        <span className="breadcrumb-item">Workspace</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{formatLabel(activeTab)}</span>
      </div>
    );
  };

  // Render correct content body based on tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            posts={posts} 
            channels={channels} 
            setActiveTab={setActiveTab} 
          />
        );
      case 'scheduler':
        return (
          <PostScheduler 
            onAddPost={handleAddPost} 
            channels={channels} 
          />
        );
      case 'queue':
        return (
          <PostQueue 
            posts={posts}
            channels={channels}
            onDeletePost={handleDeletePost} 
            onPublishPost={handlePublishPost}
            onEditPost={handleEditPost}
            setActiveTab={setActiveTab}
          />
        );
      case 'channels':
        return (
          <ChannelConnections 
            channels={channels} 
            onToggleChannel={handleToggleChannel} 
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Pane */}
      <div className="main-content">
        {/* Header Bar */}
        <header className="header-bar">
          {getBreadcrumbs()}

          <div className="header-actions">
            {/* Supabase Status indicator badge */}
            {isUsingSupabase ? (
              <div className="badge badge-success" style={{ gap: '6px', cursor: 'help' }} title="Supabase DB Connected">
                <Database size={12} />
                Supabase Online
              </div>
            ) : dbError ? (
              <div
                className="badge badge-error"
                style={{ gap: '6px', cursor: 'pointer', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                onClick={() => setActiveTab('settings')}
                title={dbError}
              >
                <Database size={12} />
                DB Error — click to fix
              </div>
            ) : (
              <div 
                className="badge badge-default" 
                style={{ gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setActiveTab('settings')}
                title="Click to configure credentials in Settings"
              >
                <Terminal size={12} />
                Demo Mode
              </div>
            )}
          </div>
        </header>

        {/* Tab Body */}
        <main className="content-body">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}
